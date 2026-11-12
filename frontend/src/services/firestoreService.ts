/**
 * firestoreService.ts
 *
 * Firestore 컬렉션: "rag-english-fair"  (단일 컬렉션, 다른 앱과 공유되는 Firebase 프로젝트 격리용)
 *
 * 문서 구조
 * ─────────────────────────────────────────────────────
 * 댓글:  { type: 'comment', postId, text, author, timestamp }
 * 좋아요: { type: 'likes',   postId, count }  (문서 ID = `likes_{postId}`)
 * ─────────────────────────────────────────────────────
 */

import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, COLLECTION } from '../firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FsComment {
  id: string;
  postId: string;
  text: string;
  author: string;
  timestamp: Date;
}

// ─── Comments ────────────────────────────────────────────────────────────────

/**
 * 댓글 추가
 */
export async function addComment(postId: string, text: string, author: string): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    type: 'comment',
    postId,
    text,
    author,
    timestamp: serverTimestamp(),
  });
}

/**
 * 🗑️ 개별 댓글 삭제 (관리자 또는 본인용)
 */
export async function deleteComment(commentId: string): Promise<void> {
  if (!commentId) return;
  const ref = doc(db, COLLECTION, commentId);
  await deleteDoc(ref);
}

/**
 * 특정 포스트의 댓글을 실시간으로 구독 (오래된 순)
 * 반환값: 구독 해제 함수 (unsubscribe)
 */
export function subscribeComments(
  postId: string,
  callback: (comments: FsComment[]) => void
): () => void {
  // 복합 색인(Composite Index) 요구를 방지하기 위해 쿼리에서는 filter만 걸고 클라이언트에서 timestamp 정렬 수행
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'comment'),
    where('postId', '==', postId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: FsComment[] = snapshot.docs.map((d) => {
        const data = d.data();
        const ts = data.timestamp as Timestamp | null;
        return {
          id: d.id,
          postId: data.postId as string,
          text: data.text as string,
          author: data.author as string,
          timestamp: ts ? ts.toDate() : new Date(),
        };
      });
      // 등록 시간 순 정렬
      comments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(comments);
    },
    (error) => {
      console.error(`Error subscribing to comments for ${postId}:`, error);
    }
  );
}

// ─── Likes ───────────────────────────────────────────────────────────────────

function likesDocRef(postId: string) {
  return doc(db, COLLECTION, `likes_${postId}`);
}

/**
 * 좋아요 수 가져오기 (1회)
 */
export async function getLikesCount(postId: string): Promise<number> {
  const snap = await getDoc(likesDocRef(postId));
  if (!snap.exists()) return 0;
  return (snap.data().count as number) ?? 0;
}

/**
 * 좋아요 토글 (서버 카운터 +1 / -1)
 */
export async function toggleLikeRemote(postId: string, liked: boolean): Promise<void> {
  const ref = likesDocRef(postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { type: 'likes', postId, count: liked ? 1 : 0 });
  } else {
    await updateDoc(ref, { count: increment(liked ? 1 : -1) });
  }
}

/**
 * 좋아요 수 실시간 구독
 */
export function subscribeLikes(postId: string, callback: (count: number) => void): () => void {
  return onSnapshot(likesDocRef(postId), (snap) => {
    if (!snap.exists()) {
      callback(0);
    } else {
      callback((snap.data().count as number) ?? 0);
    }
  });
}

// ─── User Posts (학생 개별 피드) ─────────────────────────────────────────────

export interface FsUserPost {
  id: string;
  type: 'user_post';
  postId: string;           // Firestore 규칙의 keys().hasAll(['type', 'postId']) 충족용
  authorId: string;         // 작성자 기기 UID (본인 글 삭제 권한 확인용)
  authorName: string;       // 작성자 인스타 아이디 (예: 2반_김민지)
  displayName?: string;     // 표시 이름
  avatar: string;           // 작성자 프로필 아바타
  photoUrl: string;         // 피드 사진
  caption: string;          // 피드 본문
  tag?: string;             // 부스/코너 태그
  timestamp: Date;          // 작성 시간
  likesCount?: number;      // 좋아요 수
}

/**
 * 학생 개별 피드 등록
 */
export async function addUserPost(params: {
  authorId: string;
  authorName: string;
  displayName?: string;
  avatar: string;
  photoUrl: string;
  caption: string;
  tag?: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    type: 'user_post',
    postId: `user_post_${Date.now()}`,
    authorId: params.authorId,
    authorName: params.authorName,
    displayName: params.displayName || params.authorName,
    avatar: params.avatar,
    photoUrl: params.photoUrl,
    caption: params.caption,
    tag: params.tag || '의령여고 영어 박람회',
    likesCount: 0,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * 모든 학생 피드 실시간 구독 (최신순 정렬)
 */
export function subscribeUserPosts(callback: (posts: FsUserPost[]) => void): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'user_post')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: FsUserPost[] = snapshot.docs.map((d) => {
        const data = d.data();
        const ts = data.timestamp as Timestamp | null;
        return {
          id: d.id,
          type: 'user_post',
          postId: data.postId as string,
          authorId: data.authorId as string,
          authorName: data.authorName as string,
          displayName: (data.displayName as string) || (data.authorName as string),
          avatar: data.avatar as string,
          photoUrl: data.photoUrl as string,
          caption: data.caption as string,
          tag: data.tag as string,
          likesCount: (data.likesCount as number) || 0,
          timestamp: ts ? ts.toDate() : new Date(),
        };
      });
      // 최신순 (내림차순) 정렬
      posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      callback(posts);
    },
    (error) => {
      console.error('Error subscribing to user posts:', error);
    }
  );
}

/**
 * 피드 삭제 (본인 기기 또는 선생님 관리자 권한)
 * - 포스트 문서 및 해당 포스트에 달린 모든 댓글 일괄 삭제
 */
export async function deleteUserPost(postId: string): Promise<void> {
  if (!postId) return;
  await deleteDoc(doc(db, COLLECTION, postId));
  try {
    const q = query(
      collection(db, COLLECTION),
      where('type', '==', 'comment'),
      where('postId', '==', postId)
    );
    const snap = await getDocs(q);
    const delPromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(delPromises);
  } catch (e) {
    console.error('포스트 관련 댓글 삭제 중 오류:', e);
  }
}

/**
 * 학생 피드 좋아요 토글
 */
export async function toggleUserPostLike(postId: string, incrementVal: number): Promise<void> {
  const ref = doc(db, COLLECTION, postId);
  await updateDoc(ref, {
    likesCount: increment(incrementVal),
  });
}

export interface DeleteAccountResult {
  postsCount: number;
  commentsCount: number;
}

/**
 * 🚨 공식 최고 관리자(uryeo_eng) 전용: 계정의 모든 게시물(피드) 및 작성 댓글 일괄 영구 삭제
 */
export async function deleteUserAccountAndAllPosts(authorName: string): Promise<DeleteAccountResult> {
  if (!authorName) return { postsCount: 0, commentsCount: 0 };

  const rawName = authorName.trim();
  const cleanName = rawName.replace(/^@/, '');
  const atName = `@${cleanName}`;

  // 1. 해당 계정의 피드(user_post) 검색 (cleanName 및 @cleanName 모두 커버)
  const postsQuery1 = query(
    collection(db, COLLECTION),
    where('type', '==', 'user_post'),
    where('authorName', '==', cleanName)
  );
  const postsQuery2 = query(
    collection(db, COLLECTION),
    where('type', '==', 'user_post'),
    where('authorName', '==', atName)
  );

  // 2. 해당 계정의 댓글(comment) 검색 (cleanName 및 @cleanName 모두 커버)
  const commentsQuery1 = query(
    collection(db, COLLECTION),
    where('type', '==', 'comment'),
    where('author', '==', cleanName)
  );
  const commentsQuery2 = query(
    collection(db, COLLECTION),
    where('type', '==', 'comment'),
    where('author', '==', atName)
  );

  const [postsSnap1, postsSnap2, commentsSnap1, commentsSnap2] = await Promise.all([
    getDocs(postsQuery1),
    getDocs(postsQuery2),
    getDocs(commentsQuery1),
    getDocs(commentsQuery2),
  ]);

  // 중복 ID 방지를 위해 Set 활용
  const postDocRefs = new Map<string, any>();
  postsSnap1.docs.forEach((d) => postDocRefs.set(d.id, d.ref));
  postsSnap2.docs.forEach((d) => postDocRefs.set(d.id, d.ref));

  const commentDocRefs = new Map<string, any>();
  commentsSnap1.docs.forEach((d) => commentDocRefs.set(d.id, d.ref));
  commentsSnap2.docs.forEach((d) => commentDocRefs.set(d.id, d.ref));

  // 3. 해당 사용자의 피드들에 달린 모든 댓글도 함께 조회하여 일괄 삭제 대상에 추가
  const postIds = Array.from(postDocRefs.keys());
  if (postIds.length > 0) {
    const postCommentsPromises = postIds.map((pId) =>
      getDocs(
        query(
          collection(db, COLLECTION),
          where('type', '==', 'comment'),
          where('postId', '==', pId)
        )
      )
    );
    const postCommentsSnaps = await Promise.all(postCommentsPromises);
    postCommentsSnaps.forEach((snap) => {
      snap.docs.forEach((d) => commentDocRefs.set(d.id, d.ref));
    });
  }

  // 피드 및 댓글 동시 삭제 진행
  const deletePromises: Promise<void>[] = [];
  postDocRefs.forEach((ref) => deletePromises.push(deleteDoc(ref)));
  commentDocRefs.forEach((ref) => deletePromises.push(deleteDoc(ref)));

  await Promise.all(deletePromises);

  return {
    postsCount: postDocRefs.size,
    commentsCount: commentDocRefs.size,
  };
}




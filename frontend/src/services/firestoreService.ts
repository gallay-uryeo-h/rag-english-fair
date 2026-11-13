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
  authorId?: string;
  timestamp: Date;
}

// ─── Comments ────────────────────────────────────────────────────────────────

/**
 * 댓글 추가
 */
export async function addComment(
  postId: string,
  text: string,
  author: string,
  authorId?: string
): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    type: 'comment',
    postId,
    text,
    author,
    authorId: authorId || '',
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
          authorId: (data.authorId as string) || undefined,
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

/**
 * 모든 댓글 실시간 구독 (전체 참여자 통계 및 사용자별 댓글 집계용)
 */
export function subscribeAllComments(callback: (comments: FsComment[]) => void): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'comment')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: FsComment[] = snapshot.docs
        .filter((d) => {
          const pId = d.data().postId as string;
          return pId && !pId.startsWith('photo_ticket_') && pId !== 'system_mission_settings';
        })
        .map((d) => {
          const data = d.data();
          const ts = data.timestamp as Timestamp | null;
          return {
            id: d.id,
            postId: data.postId as string,
            text: data.text as string,
            author: data.author as string,
            authorId: (data.authorId as string) || undefined,
            timestamp: ts ? ts.toDate() : new Date(),
          };
        });
      callback(comments);
    },
    (error) => {
      console.error('Error subscribing to all comments:', error);
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

// ─── 포토부스 미션 설정 (Mission Settings) ──────────────────────────────────

export interface MissionSettings {
  requiredPosts: number;       // 필요한 피드 수 (기본 1)
  requiredComments: number;    // 필요한 댓글 수 (기본 2)
  isEnabled: boolean;          // 미션 & 포토부스 활성화 여부
  title: string;               // 이벤트 명칭 / 부스 안내 문구
  bannerNotice: string;        // 학생들에게 보일 안내 문구
}

export const DEFAULT_MISSION_SETTINGS: MissionSettings = {
  requiredPosts: 1,
  requiredComments: 2,
  isEnabled: true,
  title: '의령여고 영어과 인생네컷 포토부스',
  bannerNotice: '피드 1개 + 댓글 2개 작성 시 포토부스 무료 촬영권 증정! 📸',
};

const MISSION_SETTINGS_DOC_ID = 'mission_settings_config';

/**
 * 미션 설정 실시간 구독 (단일 컬렉션 쿼리 기반 안전 구독)
 */
export function subscribeMissionSettings(callback: (settings: MissionSettings) => void): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'mission_settings')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        callback({
          requiredPosts: typeof data.requiredPosts === 'number' ? data.requiredPosts : DEFAULT_MISSION_SETTINGS.requiredPosts,
          requiredComments: typeof data.requiredComments === 'number' ? data.requiredComments : DEFAULT_MISSION_SETTINGS.requiredComments,
          isEnabled: typeof data.isEnabled === 'boolean' ? data.isEnabled : DEFAULT_MISSION_SETTINGS.isEnabled,
          title: data.title || DEFAULT_MISSION_SETTINGS.title,
          bannerNotice: data.bannerNotice || DEFAULT_MISSION_SETTINGS.bannerNotice,
        });
      } else {
        callback(DEFAULT_MISSION_SETTINGS);
      }
    },
    (err) => {
      console.warn('Error subscribing to mission settings, fallback to default:', err);
      callback(DEFAULT_MISSION_SETTINGS);
    }
  );
}

/**
 * 관리자 미션 설정 업데이트
 */
export async function updateMissionSettings(settings: Partial<MissionSettings>): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'mission_settings')
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const docRef = snap.docs[0].ref;
    await updateDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, COLLECTION), {
      type: 'mission_settings',
      postId: MISSION_SETTINGS_DOC_ID,
      ...settings,
      updatedAt: serverTimestamp(),
    });
  }
}

// ─── 포토부스 촬영권 티켓 (Photo Tickets) ──────────────────────────────────

export interface PhotoTicket {
  id: string;               // Firestore 문서 ID
  ticketId: string;         // 고유 QR 검증 토큰 (예: tk_abc123)
  authorId: string;         // 참여자 기기 고유 UID
  authorName: string;       // 참여자 익명 아이디 (예: @cherry_99)
  status: 'issued' | 'used';// 상태: 발급됨 or 사용완료
  issuedAt: Date;           // 발급 일시
  usedAt?: Date;            // 촬영 완료 일시
  isManual?: boolean;       // 관리자 수동 발급 여부
}

/**
 * 촬영권 티켓 발급 (중복 발급 방지: 이미 발급된 티켓이 있으면 기존 티켓 반환)
 */
export async function issuePhotoTicket(
  authorId: string,
  authorName: string,
  isManual: boolean = false
): Promise<PhotoTicket> {
  // 이미 발급된 티켓이 있는지 확인
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'photo_ticket'),
    where('authorId', '==', authorId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const d = snap.docs[0];
    const data = d.data();
    const ts = data.issuedAt as Timestamp | null;
    const uTs = data.usedAt as Timestamp | null;
    return {
      id: d.id,
      ticketId: data.ticketId as string,
      authorId: data.authorId as string,
      authorName: data.authorName as string,
      status: data.status as 'issued' | 'used',
      issuedAt: ts ? ts.toDate() : new Date(),
      usedAt: uTs ? uTs.toDate() : undefined,
      isManual: !!data.isManual,
    };
  }

  // 신규 티켓 생성
  const ticketId = `tk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const docRef = await addDoc(collection(db, COLLECTION), {
    type: 'photo_ticket',
    postId: ticketId,
    ticketId,
    authorId,
    authorName,
    status: 'issued',
    issuedAt: serverTimestamp(),
    isManual,
  });

  return {
    id: docRef.id,
    ticketId,
    authorId,
    authorName,
    status: 'issued',
    issuedAt: new Date(),
    isManual,
  };
}

/**
 * 특정 사용자의 티켓 실시간 구독
 */
export function subscribeUserTicket(
  authorId: string,
  callback: (ticket: PhotoTicket | null) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'photo_ticket'),
    where('authorId', '==', authorId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      const d = snapshot.docs[0];
      const data = d.data();
      const ts = data.issuedAt as Timestamp | null;
      const uTs = data.usedAt as Timestamp | null;
      callback({
        id: d.id,
        ticketId: data.ticketId as string,
        authorId: data.authorId as string,
        authorName: data.authorName as string,
        status: data.status as 'issued' | 'used',
        issuedAt: ts ? ts.toDate() : new Date(),
        usedAt: uTs ? uTs.toDate() : undefined,
        isManual: !!data.isManual,
      });
    },
    (err) => {
      console.error('Error subscribing to user ticket:', err);
      callback(null);
    }
  );
}

/**
 * 모든 티켓 실시간 구독 (관리자 모니터링 및 부스용)
 */
export function subscribeAllTickets(callback: (tickets: PhotoTicket[]) => void): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'photo_ticket')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets: PhotoTicket[] = snapshot.docs.map((d) => {
        const data = d.data();
        const ts = data.issuedAt as Timestamp | null;
        const uTs = data.usedAt as Timestamp | null;
        return {
          id: d.id,
          ticketId: data.ticketId as string,
          authorId: data.authorId as string,
          authorName: data.authorName as string,
          status: data.status as 'issued' | 'used',
          issuedAt: ts ? ts.toDate() : new Date(),
          usedAt: uTs ? uTs.toDate() : undefined,
          isManual: !!data.isManual,
        };
      });
      callback(tickets);
    },
    (err) => {
      console.error('Error subscribing to all tickets:', err);
    }
  );
}

/**
 * 부스 태블릿에서 QR 검증 및 사용 처리 (Use Ticket)
 */
export async function verifyAndUseTicket(ticketToken: string): Promise<{
  success: boolean;
  message: string;
  ticket?: PhotoTicket;
}> {
  const cleanToken = ticketToken.trim();
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'photo_ticket'),
    where('ticketId', '==', cleanToken)
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, message: '존재하지 않는 유효하지 않은 촬영권입니다.' };
  }

  const docItem = snap.docs[0];
  const data = docItem.data();

  if (data.status === 'used') {
    const usedAtDate = (data.usedAt as Timestamp | null)?.toDate()?.toLocaleTimeString() || '';
    return {
      success: false,
      message: `이미 촬영을 완료한 티켓입니다 (${usedAtDate} 사용됨).`,
      ticket: {
        id: docItem.id,
        ticketId: data.ticketId,
        authorId: data.authorId,
        authorName: data.authorName,
        status: 'used',
        issuedAt: (data.issuedAt as Timestamp | null)?.toDate() || new Date(),
        usedAt: (data.usedAt as Timestamp | null)?.toDate(),
      },
    };
  }

  // 사용 처리
  await updateDoc(docItem.ref, {
    status: 'used',
    usedAt: serverTimestamp(),
  });

  return {
    success: true,
    message: '촬영권 인증 완료! 포토부스 촬영을 시작합니다.',
    ticket: {
      id: docItem.id,
      ticketId: data.ticketId,
      authorId: data.authorId,
      authorName: data.authorName,
      status: 'used',
      issuedAt: (data.issuedAt as Timestamp | null)?.toDate() || new Date(),
      usedAt: new Date(),
    },
  };
}

/**
 * 관리자용: 티켓 상태 초기화 (재촬영 허용)
 */
export async function resetPhotoTicket(ticketDocId: string): Promise<void> {
  const ref = doc(db, COLLECTION, ticketDocId);
  await updateDoc(ref, {
    status: 'issued',
    usedAt: null,
  });
}

/**
 * 관리자용: 티켓 삭제
 */
export async function deletePhotoTicket(ticketDocId: string): Promise<void> {
  const ref = doc(db, COLLECTION, ticketDocId);
  await deleteDoc(ref);
}





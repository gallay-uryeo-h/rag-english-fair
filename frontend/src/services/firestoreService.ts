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

// ════════════════════════════════════════════════════════════════════════════════
// 사용자 활동 (UserActivity) — 인생네컷 스티커 추천용
// 문서 ID: activity_{username}  /  type: 'user_activity'
// ════════════════════════════════════════════════════════════════════════════════

export interface UserActivityDoc {
  type: 'user_activity';
  username: string;
  displayName?: string;
  mbti?: string;
  careerField?: string;
  favoriteCourse?: string;
  lastTag?: string;
  feedCount?: number;
  updatedAt?: unknown;
}

function activityDocId(username: string): string {
  return `activity_${username.trim().toLowerCase()}`;
}

/**
 * 사용자 활동 데이터를 Firestore에 저장(머지)합니다.
 */
export async function saveUserActivity(
  username: string,
  updates: Partial<Omit<UserActivityDoc, 'type' | 'username'>>
): Promise<void> {
  const ref = doc(db, COLLECTION, activityDocId(username));
  await setDoc(
    ref,
    {
      type: 'user_activity',
      username: username.trim().toLowerCase(),
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * 사용자 활동 데이터를 한 번 읽어옵니다.
 */
export async function getUserActivity(username: string): Promise<UserActivityDoc | null> {
  const ref = doc(db, COLLECTION, activityDocId(username));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserActivityDoc;
}

/**
 * 사용자 활동 데이터를 실시간으로 구독합니다.
 */
export function subscribeUserActivity(
  username: string,
  callback: (data: UserActivityDoc | null) => void
): () => void {
  const ref = doc(db, COLLECTION, activityDocId(username));
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
    } else {
      callback(snap.data() as UserActivityDoc);
    }
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// 챗봇 질문 및 대화 수집 (ChatQueryLog) — 부스 통계 & 키워드 분석용
// 문서 ID: 자동 생성  /  type: 'chat_query_log'
// ════════════════════════════════════════════════════════════════════════════════

export interface ChatQueryLog {
  id?: string;
  type: 'chat_query_log';
  username?: string;
  displayName?: string;
  targetGroup: 'student' | 'parent';
  query: string;
  answerSnippet?: string;
  timestamp: Date;
}

/**
 * 챗봇 질문을 Firestore에 실시간 기록
 */
export async function logChatQuery(entry: {
  username?: string;
  displayName?: string;
  targetGroup: 'student' | 'parent';
  query: string;
  answerSnippet?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTION), {
      type: 'chat_query_log',
      username: entry.username || 'anonymous',
      displayName: entry.displayName || '익명 참여자',
      targetGroup: entry.targetGroup,
      query: entry.query.trim(),
      answerSnippet: (entry.answerSnippet || '').slice(0, 150),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to log chat query:', err);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// 사용자 세션 (UserSession) — 아이디별 활동 집계 & 4컷 부스 연동
// 문서 ID: session_{username}  /  type: 'user_session'
//
// 필드 구조:
//   username         string        부스 로그인 아이디
//   displayName      string        표시 이름
//   uid              string        기기 고유 ID (localStorage uid)
//   firstSeenAt      Timestamp     최초 방문
//   lastActiveAt     Timestamp     마지막 활동
//   chatQueries      string[]      챗봇에 질문한 내용 목록
//   chatKeywords     string[]      질문에서 추출된 핵심 키워드 (4컷 부스 연동용)
//   feedPostIds      string[]      등록한 피드 postId 목록
//   commentedPostIds string[]      댓글 단 postId 목록
//   feedCount        number        피드 등록 수
//   commentCount     number        댓글 수
// ════════════════════════════════════════════════════════════════════════════════

export interface UserSession {
  id?: string;                 // Firestore 문서 ID
  type: 'user_session';
  username: string;
  displayName?: string;
  uid?: string;
  firstSeenAt?: Date;
  lastActiveAt?: Date;
  chatQueries: string[];
  chatKeywords: string[];      // 4컷 부스 스티커/연동용 핵심 키워드
  feedPostIds: string[];
  commentedPostIds: string[];
  feedCount: number;
  commentCount: number;
}

/** 세션 문서 ID */
function sessionDocId(username: string): string {
  return `session_${username.trim().toLowerCase()}`;
}

/** 질문 텍스트에서 핵심 키워드 추출 */
function extractKeywords(query: string): string[] {
  const KEYWORD_MAP: Record<string, string> = {
    // 과목
    '공통영어': '공통영어', '영어Ⅰ': '영어Ⅰ', '영어ⅰ': '영어Ⅰ', '영어1': '영어Ⅰ',
    '영어Ⅱ': '영어Ⅱ', '영어ⅱ': '영어Ⅱ', '영어2': '영어Ⅱ',
    '독해': '영어독해', '독해와 작문': '영어독해', '작문': '영어작문',
    '심화영어': '심화영어', '심화 영어': '심화영어',
    '세계문화': '세계문화와영어', '세계 문화': '세계문화와영어',
    '기본영어': '기본영어',
    // 주제
    '학점': '고교학점제', '학점제': '고교학점제', '이수': '이수제도', '미이수': '미이수제도',
    '5등급': '5등급제', '내신': '내신등급', '수행평가': '수행평가', '지필': '지필평가',
    '세특': '학생부세특', '학생부': '학생부세특', '학종': '학종',
    '진로': '진로연계', '적성': '적성', '선택': '과목선택',
    '대입': '대입전략', '수능': '수능영어',
  };
  const found = new Set<string>();
  for (const [key, label] of Object.entries(KEYWORD_MAP)) {
    if (query.includes(key)) found.add(label);
  }
  return Array.from(found).slice(0, 8); // 최대 8개
}

/**
 * 사용자 세션 초기화 / 업데이트 (머지)
 * - 로그인 시 or 첫 활동 시 호출
 */
export async function upsertUserSession(params: {
  username: string;
  displayName?: string;
  uid?: string;
}): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, sessionDocId(params.username));
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        type: 'user_session',
        username: params.username.trim().toLowerCase(),
        displayName: params.displayName || params.username,
        uid: params.uid || '',
        firstSeenAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        chatQueries: [],
        chatKeywords: [],
        feedPostIds: [],
        commentedPostIds: [],
        feedCount: 0,
        commentCount: 0,
      });
    } else {
      await updateDoc(ref, {
        lastActiveAt: serverTimestamp(),
        ...(params.displayName && { displayName: params.displayName }),
        ...(params.uid && { uid: params.uid }),
      });
    }
  } catch (err) {
    console.error('Failed to upsert user session:', err);
  }
}

/**
 * 챗봇 질문 세션에 추가 + 키워드 추출
 */
export async function appendChatQueryToSession(
  username: string,
  query: string
): Promise<void> {
  if (!username || username === 'anonymous') return;
  try {
    const ref = doc(db, COLLECTION, sessionDocId(username));
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data().chatQueries as string[] || []) : [];
    const existingKw = snap.exists() ? (snap.data().chatKeywords as string[] || []) : [];

    const newKeywords = extractKeywords(query);
    const mergedKw = Array.from(new Set([...existingKw, ...newKeywords])).slice(0, 20);

    if (!snap.exists()) {
      await setDoc(ref, {
        type: 'user_session',
        username: username.trim().toLowerCase(),
        firstSeenAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        chatQueries: [query.trim()],
        chatKeywords: mergedKw,
        feedPostIds: [],
        commentedPostIds: [],
        feedCount: 0,
        commentCount: 0,
      });
    } else {
      await updateDoc(ref, {
        chatQueries: [...existing.slice(-49), query.trim()], // 최대 50개
        chatKeywords: mergedKw,
        lastActiveAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Failed to append chat query to session:', err);
  }
}

/**
 * 피드 등록 시 세션에 postId 추가
 */
export async function appendFeedToSession(
  username: string,
  postId: string
): Promise<void> {
  if (!username || username === 'anonymous') return;
  try {
    const ref = doc(db, COLLECTION, sessionDocId(username));
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data().feedPostIds as string[] || []) : [];
    if (existing.includes(postId)) return;

    if (!snap.exists()) {
      await setDoc(ref, {
        type: 'user_session',
        username: username.trim().toLowerCase(),
        firstSeenAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        chatQueries: [],
        chatKeywords: [],
        feedPostIds: [postId],
        commentedPostIds: [],
        feedCount: 1,
        commentCount: 0,
      });
    } else {
      await updateDoc(ref, {
        feedPostIds: [...existing, postId],
        feedCount: increment(1),
        lastActiveAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Failed to append feed to session:', err);
  }
}

/**
 * 댓글 등록 시 세션에 postId 추가
 */
export async function appendCommentToSession(
  username: string,
  postId: string
): Promise<void> {
  if (!username || username === 'anonymous') return;
  try {
    const ref = doc(db, COLLECTION, sessionDocId(username));
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data().commentedPostIds as string[] || []) : [];

    if (!snap.exists()) {
      await setDoc(ref, {
        type: 'user_session',
        username: username.trim().toLowerCase(),
        firstSeenAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        chatQueries: [],
        chatKeywords: [],
        feedPostIds: [],
        commentedPostIds: [postId],
        feedCount: 0,
        commentCount: 1,
      });
    } else {
      await updateDoc(ref, {
        commentedPostIds: Array.from(new Set([...existing, postId])),
        commentCount: increment(1),
        lastActiveAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Failed to append comment to session:', err);
  }
}

/**
 * 특정 사용자 세션 1회 조회
 */
export async function getUserSession(username: string): Promise<UserSession | null> {
  try {
    const ref = doc(db, COLLECTION, sessionDocId(username));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      type: 'user_session',
      username: data.username,
      displayName: data.displayName,
      uid: data.uid,
      firstSeenAt: (data.firstSeenAt as Timestamp | null)?.toDate(),
      lastActiveAt: (data.lastActiveAt as Timestamp | null)?.toDate(),
      chatQueries: (data.chatQueries as string[]) || [],
      chatKeywords: (data.chatKeywords as string[]) || [],
      feedPostIds: (data.feedPostIds as string[]) || [],
      commentedPostIds: (data.commentedPostIds as string[]) || [],
      feedCount: (data.feedCount as number) || 0,
      commentCount: (data.commentCount as number) || 0,
    };
  } catch (err) {
    console.error('Failed to get user session:', err);
    return null;
  }
}

/**
 * 관리자용: 모든 사용자 세션 실시간 구독
 */
export function subscribeAllUserSessions(
  callback: (sessions: UserSession[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'user_session')
  );
  return onSnapshot(
    q,
    (snap) => {
      const sessions: UserSession[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: 'user_session',
          username: data.username || '',
          displayName: data.displayName || '',
          uid: data.uid || '',
          firstSeenAt: (data.firstSeenAt as Timestamp | null)?.toDate(),
          lastActiveAt: (data.lastActiveAt as Timestamp | null)?.toDate(),
          chatQueries: (data.chatQueries as string[]) || [],
          chatKeywords: (data.chatKeywords as string[]) || [],
          feedPostIds: (data.feedPostIds as string[]) || [],
          commentedPostIds: (data.commentedPostIds as string[]) || [],
          feedCount: (data.feedCount as number) || 0,
          commentCount: (data.commentCount as number) || 0,
        };
      });
      // 최근 활동 순
      sessions.sort((a, b) =>
        (b.lastActiveAt?.getTime() ?? 0) - (a.lastActiveAt?.getTime() ?? 0)
      );
      callback(sessions);
    },
    (err) => {
      console.error('Failed to subscribe all user sessions:', err);
    }
  );
}

/**
 * 교사용: 수집된 모든 챗봇 질문 실시간 구독
 */
export function subscribeChatQueries(
  callback: (logs: ChatQueryLog[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'chat_query_log')
  );

  return onSnapshot(
    q,
    (snap) => {
      const logs: ChatQueryLog[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: 'chat_query_log',
          username: data.username,
          displayName: data.displayName,
          targetGroup: data.targetGroup || 'student',
          query: data.query || '',
          answerSnippet: data.answerSnippet || '',
          timestamp: (data.timestamp as Timestamp | null)?.toDate() || new Date(),
        };
      });

      // 최신순 정렬
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      callback(logs);
    },
    (err) => {
      console.error('Failed to subscribe chat queries:', err);
    }
  );
}


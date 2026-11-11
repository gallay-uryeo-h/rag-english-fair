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
  increment,
  onSnapshot,
  query,
  where,
  orderBy,
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
 * 특정 포스트의 댓글을 실시간으로 구독 (오래된 순)
 * 반환값: 구독 해제 함수 (unsubscribe)
 */
export function subscribeComments(
  postId: string,
  callback: (comments: FsComment[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'comment'),
    where('postId', '==', postId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
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
    callback(comments);
  });
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

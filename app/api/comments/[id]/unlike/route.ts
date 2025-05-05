import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    
    // 检查评论是否存在
    const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [commentId]);
    const comment = (rows as any[])[0];
    
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // 更新评论的点赞数（确保不会小于0）
    const [updateResult] = await pool.execute(
      'UPDATE comments SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
      [commentId]
    );

    // 获取更新后的评论
    const [updatedRows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [commentId]);
    const updatedComment = (updatedRows as any[])[0];

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error unliking comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


/**
 * Cloudflare Pages Function
 * API Endpoint: /api/danmu
 * 
 * 重要：你必须在 Cloudflare Pages 后台设置 -> Functions -> D1 Database Bindings 中
 * 添加一个绑定，变量名(Variable name)必须设为: DANMU_DB
 */

export async function onRequestGet(context) {
  const { env } = context;

  // 1. 检查数据库是否已绑定
  if (!env.DANMU_DB) {
    // Graceful fallback for demo/unconfigured environments
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. 查询最近的 100 条弹幕
    const { results } = await env.DANMU_DB.prepare(
      "SELECT text, color, font FROM danmu ORDER BY timestamp DESC LIMIT 100"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("D1 Query Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DANMU_DB) {
    // Graceful fallback for demo/unconfigured environments
    return new Response(JSON.stringify({ success: true, meta: { mock: true } }), { 
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { text, color, font, timestamp } = body;

    // 基本验证
    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // 3. 插入数据到数据库
    const result = await env.DANMU_DB.prepare(
      "INSERT INTO danmu (text, color, font, timestamp) VALUES (?, ?, ?, ?)"
    ).bind(
      text, 
      color || '#ffffff', 
      font || '"Noto Sans SC", sans-serif', 
      timestamp || Date.now()
    ).run();

    return new Response(JSON.stringify({ success: true, meta: result }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("D1 Insert Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

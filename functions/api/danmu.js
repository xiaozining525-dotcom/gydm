
/**
 * Cloudflare Pages Function
 * 路由: /api/danmu
 * 绑定: 需要在后台将 D1 数据库绑定为变量名 "DANMU_DB"
 */

export async function onRequestGet(context) {
  const { env } = context;

  // 检查数据库绑定是否存在
  if (!env.DANMU_DB) {
    return new Response(JSON.stringify({ error: "Database binding DANMU_DB not found" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 获取最新的 100 条弹幕，按时间倒序
    const { results } = await env.DANMU_DB.prepare(
      "SELECT text, color, font FROM danmu ORDER BY timestamp DESC LIMIT 100"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DANMU_DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { text, color, font, timestamp } = body;

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // 插入数据
    await env.DANMU_DB.prepare(
      "INSERT INTO danmu (text, color, font, timestamp) VALUES (?, ?, ?, ?)"
    ).bind(text, color, font, timestamp || Date.now()).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

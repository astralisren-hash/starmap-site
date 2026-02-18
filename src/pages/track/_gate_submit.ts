export const prerender = false;

function redirectBack(who: string, next: string) {
  const base = who === "mrs" ? "/track/mrs/arrival" : "/track/adam/arrival";
  return Response.redirect(`${base}?e=1&next=${encodeURIComponent(next)}`, 303);
}

export async function POST({ request, locals, cookies }: any) {
  const form = await request.formData();
  const who = String(form.get("who") ?? "");
  const next = String(form.get("next") ?? "/track");
  const key = String(form.get("key") ?? "");

  const env = locals?.runtime?.env ?? {};
  const MRS_KEY = env.MRS_TRACK_KEY ?? "";
  const ADAM_KEY = env.ADAM_TRACK_KEY ?? "";

  const required = who === "mrs" ? MRS_KEY : who === "adam" ? ADAM_KEY : "";

  if (!required || key !== required) return redirectBack(who, next);

  // Cookie scopes: once entered, access the rest of that track
  const cookieName = who === "mrs" ? "starmap_track_mrs" : "starmap_track_adam";
  const cookiePath = who === "mrs" ? "/track/mrs" : "/track/adam";

  cookies.set(cookieName, "1", {
    path: cookiePath,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 6 // 6 hours
  });

  return Response.redirect(next, 303);
}

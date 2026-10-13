const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

console.log("URL set:", !!url, "(length:", url.length + ")");
console.log("Key set:", !!key, "(length:", key.length + ", starts with:", key.substring(0, 16) + "...)");

const supabase = createClient(url, key);

async function run() {
  console.log("\nQuerying courses table...");
  const { data, error } = await supabase.from("courses").select("course_code").limit(3);
  if (error) {
    console.log("ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", JSON.stringify(data));
  }

  console.log("\nQuerying modules table...");
  const { data: mods, error: modErr } = await supabase.from("modules").select("module_id, module_title").limit(3);
  if (modErr) {
    console.log("ERROR:", JSON.stringify(modErr, null, 2));
  } else {
    console.log("SUCCESS:", JSON.stringify(mods));
  }

  console.log("\nQuerying questions count...");
  const { count, error: countErr } = await supabase.from("questions").select("*", { count: "exact", head: true });
  if (countErr) {
    console.log("ERROR:", JSON.stringify(countErr, null, 2));
  } else {
    console.log("SUCCESS: Total questions =", count);
  }
}

run();

export async function storeContent(store, content, prefix = "prompt") {
  const key = `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  // Store content in R2
  await store.put(key, content);

  return key;
}

export async function getContent(store, key) {
  // Retrieve content from R2
  const object = await store.get(key);

  if (object === null) {
    throw new Error("Content not found");
  }

  return object.text();
}

export async function deleteContent(store, key) {
  // Delete content from R2
  await store.delete(key);
  return true;
}
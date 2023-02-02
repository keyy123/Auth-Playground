async function postRequest(url, body) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

async function getRequest(url) {
  const res = await fetch(url, {
    // Read the MDN Documentation and wanted to try controlling cache
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "max-age=60, private",
    },
  });
  return await res.json();
}

async function putRequest(url, id, body) {
  const res = await fetch(`${url}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}

async function deleteRequest(url, id) {
  const res = await fetch(`${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

export { postRequest, getRequest, putRequest, deleteRequest };

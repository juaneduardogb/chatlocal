def split_text(text, max_tokens=8192) -> list[str]:
    words = text.split()
    chunks = []
    chunk = []
    chunk_length = 0

    for word in words:
        word_length = len(word) + 1  # Adding 1 for the space
        if chunk_length + word_length > max_tokens:
            chunks.append(" ".join(chunk))
            chunk = []
            chunk_length = 0
        chunk.append(word)
        chunk_length += word_length

    if chunk:
        chunks.append(" ".join(chunk))

    return chunks

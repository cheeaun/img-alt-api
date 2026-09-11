img-alt-api
===

Simple API endpoint for image alt description generation, powered by [OpenAI Vision](https://platform.openai.com/docs/guides/images-vision).

This is inspired by [Ice Cubes](https://github.com/Dimillian/IceCubesApp/commit/28ab417b0afc909728da5be541f345e99cb254e2). It's [really cool](https://mastodon.online/@IceCubesApp/111522921731485386).

- Written in [Deno](https://deno.com/).
- Serverless, on [Deno Deploy](https://deno.com/deploy).
- There's no front-end.
- Uses [OpenAI Vision](https://platform.openai.com/docs/guides/images-vision).

## Development

Requires [Deno](https://deno.com/).

Add environment variable `OPENAI_API_KEY`. Could create a `.env` file and put the variable there too.

- `deno task dev` - Run the server with watch mode, for development.
- `deno task debug` - Run the server with watch mode and debugging, for development.
- `deno task start` - Run the server.

Additional environment variables:

- `OPENAI_BASE_URL` - Custom OpenAI-compatible API base URL (e.g. `https://api.openai.com/v1`). Defaults to OpenAI's official endpoint.
- `OPENAI_MODEL` - Model to use, defaults to `gpt-5.6-luna`.
- `OPENAI_API_TYPE` - API style to use: `responses` (default, OpenAI Responses API) or `chat` (older `/v1/chat/completions` compatible with most other providers).
- `MAX_TOKENS` - Maximum output tokens, defaults to `140`.
- `UPLOAD_LIMIT` - Maximum uploaded image size in bytes, defaults to `10485760` (10MB).

## Using another provider

Most OpenAI-compatible providers only support the older `/v1/chat/completions` endpoint. To switch to one:

1. Set `OPENAI_API_TYPE=chat`.
2. Set `OPENAI_BASE_URL` to the provider's OpenAI-compatible base URL.
3. Set `OPENAI_MODEL` to the provider's model name.
4. Set `OPENAI_API_KEY` to the provider's API key.

### Example: Gemini

Gemini supports OpenAI-compatible requests via the [Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai) endpoint.

```bash
OPENAI_API_TYPE=chat \
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/ \
OPENAI_MODEL=gemini-2.5-flash \
OPENAI_API_KEY=your-gemini-api-key \
MAX_TOKENS=1024 \
deno task start
```

## REST API Endpoints

- `GET /?image=<image-url>`
- `POST /` with `image` key as `multipart/form-data`.

Response:

```json
{
  "description": "a picture of a cat"
}
```

Error response:

```json
{
  "error": "Failed to generate description"
}
```

## License

[MIT](https://cheeaun.mit-license.org/).

## References

- https://github.com/Dimillian/IceCubesApp/
- https://github.com/JeremiahDMoore/gpt4-vision

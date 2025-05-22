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

- `OPENAI_MODEL` - OpenAI model to use, defaults to `gpt-4.1-nano`.

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

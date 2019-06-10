# Egendata-national-registration

Example of how a national registry could participate in the Egendata ecosystem as a Data Source

## Configuration

Create a file named `.env` in the project directory containing URLs needed for the services to find each other, example for a developers machine:

```bash
# Environment: development, test or production
NODE_ENV=development

# PORT is optional and defaults to 5000
PORT=5000

CLIENT_ID=http://localhost:5000
OPERATOR_URL=http://localhost:3000

# APM_SERVER is optional, apm will not be used if APM_SERVER is not set
APM_SERVER=http://localhost:8200
# APM_TOKEN is optional, defaults to ''
APM_TOKEN=abc

# Client keys (generate your own or use these FOR TESTING ONLY)
PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----\nMIGJAoGBAKTLav2tYHGfN8ycmrpvFuCqveDrTp2yHihtnRS9gS63ChEJQjV/g9+l\n0toVaKzzwVHzK2DUIMLfXXKSoECHUgDYydsffA1t1kSTiOvxPm/futQWIv/F5nsG\niKfROSLp2TFNgvyrjR9yUryBuxLMQ4vqrWdXACtIYeAPrJGsD9UpAgMBAAE=\n-----END RSA PUBLIC KEY-----\n"
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCky2r9rWBxnzfMnJq6bxbgqr3g606dsh4obZ0UvYEutwoRCUI1\nf4PfpdLaFWis88FR8ytg1CDC311ykqBAh1IA2MnbH3wNbdZEk4jr8T5v37rUFiL/\nxeZ7Boin0Tki6dkxTYL8q40fclK8gbsSzEOL6q1nVwArSGHgD6yRrA/VKQIDAQAB\nAoGAfdZHMMa/qoOmHDxJeqtxkMVQkPud4JUuqjhphnjeuElVCoVDZY6lqJX7WESY\n1dicenNxYFMbYTMnLGICtMOgPYOZjkMfoa1LOx5hmqe1Z29DzmLWr27BqY7cZU+T\nxx3xvWNaNkBy3v9RhxZv55Uxzz1ys/cAmxhUmsgbtR2brvECQQDPjNMITnIcjFgA\nROvzKUQAOl8yWCl9h5dtG7WAdFppD5tn/L1u3E9N3U7QSKBfhma7KzASu76B3tSC\nyxG7o+XTAkEAy0OHbAt41ZdkIF4qYg9IX4lO5hlbyjJHwhLUv4DgZNT8fMgQpuc0\nMLu0ADChgI80sxb84T+v/QDzylDEDOaPkwJBAI6G6YDBxhEeu2vr6JBCXUU+0JLV\nAiEHFRDDP3/n5xJQumrNoBTaS8dv26iixybyN+f+f3PN48RxjkQHSbUulysCQG5p\nJRN0e9OR46qNW/peENMMU9Y7ahfADiiGcBgCGmHLK8dgKWNv7XKXUyRTRjb+EwNA\n9mYoYSFONh7slkHnr48CQDEygmde8p1JWWUmXseEVv9Il7DmTKlI0rXXgK+Z299D\nCJKeDmbK0wMhimdKI9ck5WH2a/SJu35EMe1hwmdy524=\n-----END RSA PRIVATE KEY-----\n"
```

- `CLIENT_ID` is the URL where the phone app can reach this service (with protocol, http/https).
- `OPERATOR_URL` is the URL where this service can reach the operator (with protocol, http/https)
- `APM_SERVER` and `APM_TOKEN` is so that this service can reach [APM](https://www.npmjs.com/package/elastic-apm-node) for logging requests and errors

Good luck.

## Attributions

**Favicon**: Icons made by [Freepik](https://www.freepik.com/) from [Flaticon](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)

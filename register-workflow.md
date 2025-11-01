[Client (body: name,email,password,...)]
|
v
[POST /api/auth/register]
|
v
[Middleware: rate-limit, body-parser, helmet]
|
v
[Validate Request Schema]
|
|-- invalid -> 400 { error, details }
|
v
[Normalize input (trim, lowercase email)]
|
v
[Check Email Exists (atomic)]
|
|-- exists -> 409 { error: "Email already in use" }
|
v
[Extra checks (blacklist, disposable email, password strength)]
|
v
[Hash password (bcrypt / argon2)]
|
v
[Create User in DB (status: pending/emailNotVerified?) ]
|
v
[Create verification token (if email flow) OR create JWT]
|
v
[Send email (async job queue) OR return JWT]
|
v
[Return 201 { user (sanitized), token or message }]

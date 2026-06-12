Important implication
This means:

old tokens continue to work until expiry
server restarts do not invalidate them
token invalidation requires extra work if you want it
If you want server-side control
You’d need one of these:

a token blacklist/denylist
a token version number stored on the user record
rotate JWT_SECRET to invalidate everything
But for now, with your current code, JWTs are effectively stateless and not stored on the server.
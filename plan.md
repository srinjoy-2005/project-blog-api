database

# User
id
fullname 
account_creation_date
username unique
hashed_password

# Posts
id
created_date
title
body
author - **foreignkey User's username**
isPublished boolean

# Comments
id
created_date
commenter - **foreignkey User's username**
comment_on - **foreignkey Posts' postid**
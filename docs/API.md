API
===

## Repo API
### GET /api/repos
fetch repo list

### GET /api/repos/:name
fetch repo detail

### POST /api/repos/:name
create new repo


## Branch API
### GET /repos/:name/branches

### GET /repos/:name/branches/:branch

### GET /repos/:name/branches/:branch/commits

### GET /repos/:name/branches/:branch/tree/:path

### GET /repos/:name/branches/:branch/blob/:path


## Tag API
### GET /repos/:name/tags

### GET /repos/:name/tags/:tag

### GET /repos/:name/tags/:tag/commits

### GET /repos/:name/tags/:tag/tree/:path

### GET /repos/:name/tags/:tag/blob/:path


## Commit API
### GET /repos/:name/commits/:commit/commits

### GET /repos/:name/commits/:commit/tree/:path

### GET /repos/:name/commits/:commit/blob/:path

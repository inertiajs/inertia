function makeUser(id) {
  return {
    id,
    name: `User ${id}`,
  }
}

function getUsers(page = 1, perPage = 15, total = 40, orderByDesc = false) {
  // orderByDesc = false
  // page = 1 => User 1 ... 15, page = 3 => User 31 ... 40

  // orderByDesc = true
  // page = 1 => User 40 ... 26, page = 3 => User 10 ... 1

  if (orderByDesc) {
    const start = total - (page - 1) * perPage
    const end = Math.max(start - perPage + 1, 1)

    const users = []
    for (let i = start; i >= end; i--) {
      users.push(makeUser(i))
    }

    return users
  } else {
    const start = (page - 1) * perPage + 1
    const end = Math.min(start + perPage - 1, total)

    const users = []
    for (let i = start; i <= end; i++) {
      users.push(makeUser(i))
    }

    return users
  }
}

export function simplePaginateUsers(page = 1, perPage = 15, total = 40, orderByDesc = false) {
  const users = getUsers(page, perPage, total, orderByDesc)
  const hasMore = getUsers(page + 1, perPage, total, orderByDesc).length > 0

  const paginated = {
    current_page: page,
    data: users,
    from: users[0]?.id || null,
    per_page: perPage,
    to: users[users.length - 1]?.id || null,
  }

  return {
    paginated,
    scrollProp: {
      pageName: 'page',
      previousPage: page > 1 ? page - 1 : null,
      nextPage: hasMore ? page + 1 : null,
      currentPage: page,
    },
  }
}

export function paginateUsers(page = 1, perPage = 15, total = 40, orderByDesc = false) {
  const users = getUsers(page, perPage, total, orderByDesc)
  const hasMore = getUsers(page + 1, perPage, total, orderByDesc).length > 0

  return {
    paginated: {
      current_page: page,
      data: users,
      per_page: perPage,
      to: users[users.length - 1]?.id || null,
      total,
    },
    scrollProp: {
      pageName: 'page',
      previousPage: page > 1 ? page - 1 : null,
      nextPage: hasMore ? page + 1 : null,
      currentPage: page,
    },
  }
}

export function cursorPaginateUsers(page = 1, perPage = 15, total = 40, orderByDesc = false) {
  const users = getUsers(page, perPage, total, orderByDesc)
  const hasMore = getUsers(page + 1, perPage, total, orderByDesc).length > 0

  return {
    paginated: {
      data: users,
      per_page: perPage,
      next_cursor: hasMore ? page + 1 : null,
      prev_cursor: page === 1 ? null : page - 1,
    },
    scrollProp: {
      pageName: 'page',
      previousPage: page > 1 ? page - 1 : null,
      nextPage: hasMore ? page + 1 : null,
      currentPage: page,
    },
  }
}

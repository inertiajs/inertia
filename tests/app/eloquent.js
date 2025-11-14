function makeUser(id) {
  return {
    id,
    name: `User ${id}`,
  }
}

export function getUserNames() {
  return [
    'Adelle Crona DVM',
    'Alison Walter PhD',
    'Aliza Langosh II',
    'Amara DuBuque',
    'Amaya Lang',
    'Angelica Rodriguez',
    'Anjali Windler',
    'Ansley Gusikowski',
    'Asha Welch II',
    'Bailee Zulauf',
    'Barrett Heathcote',
    'Beryl Morar',
    'Bethany Grant',
    'Braden Mayert II',
    'Breana Herzog',
    'Camylle Metz Sr.',
    'Carmen Kerluke',
    'Casimer McClure',
    'Cecil Walsh',
    'Chandler McKenzie',
    'Chaya Rempel',
    'Chelsey Mertz Jr.',
    'Coralie Auer',
    'Daniella Hoppe',
    'Daphnee Douglas',
    'Davonte Heathcote',
    'Dejah Parisian',
    'Demarco Medhurst',
    'Dewayne Rau',
    'Diamond Gibson PhD',
    'Diamond Herzog',
    'Dino Predovic I',
    'Domingo Luettgen',
    'Dora Runolfsdottir',
    'Dr. Billy Larkin',
    'Dr. Chase Green',
    'Dr. Curtis Lehner',
    'Einar Crona MD',
    'Eloisa Pollich',
    'Elsie Goldner',
    'Emma Little Sr.',
    'Erika Ziemann DDS',
    'Ethan Beatty',
    'Euna Boehm',
    'Euna Kerluke',
    'Felton Yost',
    'Genesis Hand',
    'Hailie Quitzon',
    'Helga Waelchi',
    'Ibrahim Jakubowski',
    'Jack Halvorson',
    'Jasmin Stoltenberg',
    'Jennie Olson PhD',
    'Jimmy Gusikowski',
    'Joy Schimmel',
    'Kamron Bechtelar DDS',
    'Katarina McLaughlin',
    'Katharina Towne',
    'Kavon Sporer',
    'Keshawn Langosh DDS',
    'Lacy Johnston V',
    'Lauren Thiel',
    'Lelia Haley',
    'Lonny Hermiston',
    'Lupe Jacobs',
    'Magdalena Rowe',
    'Marjolaine Gleason',
    'Mattie Bradtke',
    'Miss Amiya Altenwerth',
    'Miss Haven Kuhic',
    'Miss Janie Bayer',
    'Miss Raegan Doyle IV',
    'Molly Murray',
    'Niko Christiansen Jr.',
    'Paxton Koss',
    'Reilly Bechtelar',
    'Rex Blanda',
    'Riley Legros',
    'River Pfeffer',
    'Rory Lubowitz',
    'Rosamond Mueller II',
    'Rosario Nicolas Sr.',
    'Sandrine Hammes',
    'Tad Thompson',
    'Talon Fahey DVM',
    'Taylor Kuhlman IV',
    'Tyler Zieme',
    'Vella Price',
    'Virginie Beatty',
    'Wiley Donnelly',
    'Woodrow Kuvalis',
  ]
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

export function paginateUsers(page = 1, perPage = 15, total = 40, orderByDesc = false, pageName = 'page') {
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
      pageName,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: hasMore ? page + 1 : null,
      currentPage: page,
      reset: false,
    },
  }
}

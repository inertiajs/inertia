import { Link } from '@inertiajs/react'

let originalScrollTo: typeof window.scrollTo | null = null

export default ({ page }: { page: number }) => {
  // Patch scrollTo to log synchronously when it's called (not when the scroll event fires)
  if (!originalScrollTo) {
    originalScrollTo = window.scrollTo.bind(window)

    window.scrollTo = ((xOrOptions: number | ScrollToOptions, y?: number) => {
      const firstArgIsNumber = typeof xOrOptions === 'number'
      const scrollY = firstArgIsNumber ? y : (xOrOptions?.top ?? 0)

      console.log('ScrollY', scrollY)

      return firstArgIsNumber ? originalScrollTo!(xOrOptions, y!) : originalScrollTo!(xOrOptions)
    }) as typeof window.scrollTo
  } else {
    console.log('Render')
  }

  return (
    <>
      <h1 style={{ fontSize: '40px' }}>Article Header</h1>
      <h2 style={{ fontSize: '40px' }}>Page {page}</h2>
      <article style={{ fontSize: '20px', maxWidth: '500px' }}>
        <p>
          Sunt culpa sit sunt enim aliquip. Esse ea ea quis voluptate. Enim consectetur aliqua ex ex magna cupidatat id
          minim sit elit.
        </p>
        <Link
          href={`/scroll-after-render/${page + 1}`}
          style={{ display: 'block', marginTop: '20px' }}
          onBefore={() => window.scrollTo(0, 100)}
        >
          Go to page {page + 1}
        </Link>
        {Array(500).map(() => (
          <div>
            <p>
              Sunt culpa sit sunt enim aliquip. Esse ea ea quis voluptate. Enim consectetur aliqua ex ex magna cupidatat
              id minim sit elit. Amet pariatur occaecat pariatur duis eiusmod dolore magna. Et commodo cupidatat in
              commodo elit cupidatat minim qui id non enim ad. Culpa aliquip ad Lorem sit consectetur ullamco culpa duis
              nisi et fugiat mollit eiusmod. Laboris voluptate veniam consequat proident in nulla irure velit.
            </p>

            <p>
              Sit sint laboris sunt eiusmod ipsum laborum eiusmod amet commodo exercitation in duis magna. Proident sunt
              minim in elit qui. Id pariatur commodo fugiat excepteur in deserunt Lorem ipsum occaecat est. Excepteur
              sit tempor ipsum ex officia veniam enim amet velit fugiat mollit cillum. Incididunt aliqua nulla id
              occaecat nulla. Non ea ad est occaecat deserunt officia qui commodo exercitation.
            </p>

            <p>
              Voluptate laborum quis aliqua ullamco magna amet ullamco laborum qui cillum eu. Dolore dolore aliqua
              proident proident sunt ipsum in. Enim velit dolore labore dolor quis incididunt duis culpa Lorem. Eu
              adipisicing non elit fugiat voluptate labore ipsum dolore consectetur commodo. Et in et cillum duis
              consequat quis ex eu commodo. Eiusmod aliqua excepteur consectetur eiusmod aute et consectetur sit
              pariatur dolore qui officia pariatur.
            </p>

            <p>
              Non sunt eu mollit qui reprehenderit. Aute culpa anim voluptate do in esse duis laborum ad dolore. Ullamco
              nisi in nostrud officia do. Duis pariatur officia id duis. Deserunt ad incididunt est sint consectetur
              reprehenderit mollit est Lorem ea pariatur anim dolor adipisicing. Nostrud irure magna nostrud laboris
              aute sunt veniam laboris veniam incididunt sit. Nulla proident ad aliqua fugiat culpa sunt est in dolor
              velit ad irure nulla.
            </p>

            <p>
              Do aute laborum deserunt non laborum voluptate voluptate. Anim ut laborum magna sunt cupidatat irure.
              Cupidatat fugiat minim sint cillum laborum excepteur irure id est irure ad occaecat adipisicing enim.
              Deserunt nulla anim proident velit irure nostrud est est reprehenderit consequat pariatur qui. Fugiat
              Lorem sint eu laborum minim pariatur cillum mollit nulla consequat ullamco ex. Ex consectetur ad ut irure
              fugiat occaecat aliqua exercitation cillum ipsum anim dolore tempor.
            </p>

            <p>
              Adipisicing consequat irure fugiat Lorem deserunt aliquip do cupidatat. Lorem labore elit ex qui nostrud
              qui cillum sunt adipisicing occaecat. Sunt nostrud amet amet cupidatat fugiat Lorem quis nulla id cillum
              esse eu. Ullamco aliqua dolore irure amet mollit anim velit dolore.
            </p>

            <p>
              Veniam cupidatat ipsum ea officia ipsum nisi laborum culpa qui dolore. Aliqua Lorem nisi labore ea velit
              aliquip irure excepteur eu. Laboris proident duis non labore sunt quis aute tempor laboris enim anim
              eiusmod.
            </p>

            <p>
              Minim proident ut aliqua ea ut culpa fugiat ullamco nisi esse nostrud reprehenderit id. Id id ullamco
              velit anim nisi magna Lorem tempor. Et veniam occaecat ut labore consequat fugiat duis.
            </p>

            <p>
              Adipisicing ea consectetur adipisicing aute eu pariatur enim labore consequat occaecat consectetur minim
              nisi. Cillum commodo sunt labore reprehenderit. Duis esse excepteur magna tempor eiusmod exercitation
              Lorem reprehenderit excepteur pariatur. Esse cupidatat occaecat magna do aliquip Lorem. Consectetur
              adipisicing consequat dolore nostrud esse eu cillum id commodo duis. Aliquip dolor cillum cupidatat
              fugiat.
            </p>

            <p>
              Ex eiusmod id est laborum sunt ex ea aute adipisicing ad magna deserunt duis. Nostrud velit dolore id
              commodo quis enim fugiat. Sint non quis consectetur voluptate aliqua dolore nulla. Irure sit reprehenderit
              sint laboris non elit. Duis minim nisi esse dolor. Sit ex in consequat non occaecat commodo irure et.
              Commodo qui ipsum Lorem magna consequat consequat et minim eiusmod Lorem eiusmod cupidatat voluptate.
            </p>
          </div>
        ))}
      </article>
    </>
  )
}

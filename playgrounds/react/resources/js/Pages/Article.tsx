import { Head } from '@inertiajs/react'
import Layout from '../Components/Layout'

const Article = () => {
  return (
    <>
      <Head title="Article" />
      <h1 className="text-3xl">Article</h1>
      <article className="max-w-3xl">
        <p className="my-6">
          Sunt culpa sit sunt enim aliquip. Esse ea ea quis voluptate. Enim consectetur aliqua ex ex magna cupidatat id
          minim sit elit. Amet pariatur occaecat pariatur duis eiusmod dolore magna. Et commodo cupidatat in commodo
          elit cupidatat minim qui id non enim ad. Culpa aliquip ad Lorem sit consectetur ullamco culpa duis nisi et
          fugiat mollit eiusmod. Laboris voluptate veniam consequat proident in nulla irure velit.
        </p>
        <p className="my-6">
          Sit sint laboris sunt eiusmod ipsum laborum eiusmod amet commodo exercitation in duis magna. Proident sunt
          minim in elit qui. Id pariatur commodo fugiat excepteur in deserunt Lorem ipsum occaecat est. Excepteur sit
          tempor ipsum ex officia veniam enim amet velit fugiat mollit cillum. Incididunt aliqua nulla id occaecat
          nulla. Non ea ad est occaecat deserunt officia qui commodo exercitation.
        </p>
        <p className="my-6">
          Voluptate laborum quis aliqua ullamco magna amet ullamco laborum qui cillum eu. Dolore dolore aliqua proident
          proident sunt ipsum in. Enim velit dolore labore dolor quis incididunt duis culpa Lorem. Eu adipisicing non
          elit fugiat voluptate labore ipsum dolore consectetur commodo. Et in et cillum duis consequat quis ex eu
          commodo. Eiusmod aliqua excepteur consectetur eiusmod aute et consectetur sit pariatur dolore qui officia
          pariatur.
        </p>
        <p className="my-6">
          Non sunt eu mollit qui reprehenderit. Aute culpa anim voluptate do in esse duis laborum ad dolore. Ullamco
          nisi in nostrud officia do. Duis pariatur officia id duis. Deserunt ad incididunt est sint consectetur
          reprehenderit mollit est Lorem ea pariatur anim dolor adipisicing. Nostrud irure magna nostrud laboris aute
          sunt veniam laboris veniam incididunt sit. Nulla proident ad aliqua fugiat culpa sunt est in dolor velit ad
          irure nulla.
        </p>
        <p className="my-6">
          Do aute laborum deserunt non laborum voluptate voluptate. Anim ut laborum magna sunt cupidatat irure.
          Cupidatat fugiat minim sint cillum laborum excepteur irure id est irure ad occaecat adipisicing enim. Deserunt
          nulla anim proident velit irure nostrud est est reprehenderit consequat pariatur qui. Fugiat Lorem sint eu
          laborum minim pariatur cillum mollit nulla consequat ullamco ex. Ex consectetur ad ut irure fugiat occaecat
          aliqua exercitation cillum ipsum anim dolore tempor.
        </p>
        <p className="my-6">
          Adipisicing consequat irure fugiat Lorem deserunt aliquip do cupidatat. Lorem labore elit ex qui nostrud qui
          cillum sunt adipisicing occaecat. Sunt nostrud amet amet cupidatat fugiat Lorem quis nulla id cillum esse eu.
          Ullamco aliqua dolore irure amet mollit anim velit dolore.
        </p>
        <p className="my-6">
          Veniam cupidatat ipsum ea officia ipsum nisi laborum culpa qui dolore. Aliqua Lorem nisi labore ea velit
          aliquip irure excepteur eu. Laboris proident duis non labore sunt quis aute tempor laboris enim anim eiusmod.
        </p>
        <p className="my-6">
          Minim proident ut aliqua ea ut culpa fugiat ullamco nisi esse nostrud reprehenderit id. Id id ullamco velit
          anim nisi magna Lorem tempor. Et veniam occaecat ut labore consequat fugiat duis.
        </p>
        <p className="my-6">
          Adipisicing ea consectetur adipisicing aute eu pariatur enim labore consequat occaecat consectetur minim nisi.
          Cillum commodo sunt labore reprehenderit. Duis esse excepteur magna tempor eiusmod exercitation Lorem
          reprehenderit excepteur pariatur. Esse cupidatat occaecat magna do aliquip Lorem. Consectetur adipisicing
          consequat dolore nostrud esse eu cillum id commodo duis. Aliquip dolor cillum cupidatat fugiat.
        </p>
        <h2 id="far-down" className="mt-8 text-2xl">
          Far down
        </h2>
        <p className="my-6">
          Ex eiusmod id est laborum sunt ex ea aute adipisicing ad magna deserunt duis. Nostrud velit dolore id commodo
          quis enim fugiat. Sint non quis consectetur voluptate aliqua dolore ad voluptate nulla. Irure sit
          reprehenderit sint laboris non elit. Duis minim nisi esse dolor. Sit ex in consequat non occaecat commodo
          irure et. Commodo qui ipsum Lorem magna consequat consequat et minim eiusmod Lorem eiusmod cupidatat
          voluptate.
        </p>
      </article>
    </>
  )
}

Article.layout = (page) => <Layout children={page} />

export default Article

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import "./marketing.css";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/feed");
  }

  return (
    <main id="main-content" className="landing">
      <div className="wrap">
        <nav className="nav">
          <span className="wordmark">Wokra</span>
          <Link href="/sign-in" className="nav-signin">
            Se connecter
          </Link>
        </nav>

        <section className="hero">
          <div>
            <h1 className="hero-headline">
              Montre ton travail. <em>Pas ton pitch.</em>
            </h1>
            <p className="hero-sub">
              Wokra est un réseau professionnel où le profil se construit à partir de ce que tu as
              réellement livré — un dépôt, un produit en ligne, une étude de cas — jamais
              d&apos;adjectifs.
            </p>
            <div className="hero-actions">
              <Link href="/sign-in" className="btn-primary">
                Créer mon profil
              </Link>
              <a href="#exemple" className="link-ghost">
                voir un profil type
              </a>
            </div>
            <div className="receipt">
              <span>
                <b>0</b> compteur public
              </span>
              <span>
                <b>100%</b> cœur gratuit
              </span>
              <span>
                <b>2</b> méthodes de vérification
              </span>
            </div>
          </div>
          <div className="hero-aside">
            <div className="step">
              <span className="num">01</span>
              Créer ton profil
            </div>
            <div className="step">
              <span className="num">02</span>
              Relier tes artefacts
            </div>
            <div className="step">
              <span className="num">03</span>
              Faire vérifier ce qui compte
            </div>
          </div>
        </section>

        <section className="example" id="exemple">
          <p className="example-label">Un artefact, tel qu&apos;il apparaît sur un profil</p>
          <article className="card">
            <span className="crosshair tl" aria-hidden="true" />
            <span className="crosshair br" aria-hidden="true" />
            <div>
              <p className="card-kind">Repo</p>
              <h3>API de facturation temps réel</h3>
              <p>
                Moteur de facturation à l&apos;usage pour une marketplace B2B — idempotence stricte,
                réconciliation automatique, 40k requêtes/min en pic.
              </p>
              <div className="stack">
                <span>TypeScript</span>
                <span>PostgreSQL</span>
                <span>Redis</span>
                <span>Docker</span>
              </div>
            </div>
            <div className="stamp">
              Vérifié
              <small>via github.com</small>
            </div>
          </article>
        </section>

        <section className="differentiators">
          <h2>Ce qui change par rapport à un réseau pro classique</h2>
          <div className="diff-grid">
            <div className="diff-item">
              <span className="tag">Feed</span>
              <p>
                Trié sur tes artefacts et tes centres d&apos;intérêt déclarés — jamais sur ce qui
                génère le plus d&apos;engagement.
              </p>
            </div>
            <div className="diff-item">
              <span className="tag">Métriques</span>
              <p>Aucun compteur de likes, de vues ou d&apos;abonnés n&apos;est jamais affiché.</p>
            </div>
            <div className="diff-item">
              <span className="tag">Accès</span>
              <p>
                Profil, recherche, messagerie, candidature : gratuit, sans palier premium qui bride
                ta visibilité.
              </p>
            </div>
            <div className="diff-item">
              <span className="tag">Preuve</span>
              <p>
                Le badge Vérifié n&apos;apparaît que si la propriété du repo ou du domaine est
                confirmée.
              </p>
            </div>
          </div>
        </section>

        <section className="footer-cta">
          <h2>Ton travail parle. On l&apos;écoute.</h2>
          <Link href="/sign-in" className="btn-primary">
            Créer mon profil
          </Link>
        </section>

        <footer>
          <span>Wokra</span>
          <span>Réseau professionnel — preuve par le travail</span>
        </footer>
      </div>
    </main>
  );
}

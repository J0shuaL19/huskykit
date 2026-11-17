import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page page-shell">
      <section className="home-page__hero">
        <p className="home-page__eyebrow">Northeastern student experiences</p>
        <h1>Useful advice, easier to find.</h1>
        <p>
          HuskyKit brings practical campus knowledge into one place, so you can find experiences
          when you need them.
        </p>
        <Link className="home-page__cta" to="/campus">
          Explore Campus Life <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section aria-labelledby="explore-heading">
        <div className="home-page__section-heading">
          <h2 id="explore-heading">Explore experiences</h2>
          <p>Browse freely. Reading posts does not require an account.</p>
        </div>
        <div className="home-page__cards">
          <Link className="home-page__card" to="/campus">
            <span className="home-page__card-icon" aria-hidden="true">
              ◇
            </span>
            <h3>Campus Life</h3>
            <p>Housing, commuting, affordable food, and things to do around Boston.</p>
            <span className="home-page__card-link">Browse posts →</span>
          </Link>
          <Link className="home-page__card" to="/academic">
            <span className="home-page__card-icon" aria-hidden="true">
              ▦
            </span>
            <h3>Academic Experiences</h3>
            <p>Study tips, course planning, group projects, and academic resources.</p>
            <span className="home-page__card-link">Browse posts →</span>
          </Link>
        </div>
      </section>
      <section className="home-page__instructions" aria-labelledby="how-heading">
        <h2 id="how-heading">How to use HuskyKit</h2>
        <ol>
          <li>Choose a section, search by keyword, and apply filters.</li>
          <li>Open a post to read the experience, tips, author, and last update.</li>
          <li>
            Register or log in to share an academic experience. Your own posts show Edit and Delete
            actions.
          </li>
        </ol>
        <p>
          Posts labeled “Demo” are synthetic examples. Check official resources for current
          information.
        </p>
      </section>
    </div>
  );
}

HomePage.propTypes = {};

export default HomePage;

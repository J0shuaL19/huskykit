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
          <div className="home-page__card home-page__card--pending">
            <span className="home-page__card-icon" aria-hidden="true">
              ▦
            </span>
            <h3>Academic Experiences</h3>
            <p>Study tips, course planning, group projects, and academic resources.</p>
            <span className="home-page__coming">Coming soon</span>
          </div>
        </div>
      </section>
    </div>
  );
}

HomePage.propTypes = {};

export default HomePage;

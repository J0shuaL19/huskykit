import { Link, NavLink } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/">
          <span className="site-header__brand-mark" aria-hidden="true">
            H
          </span>
          HuskyKit
        </Link>
        <nav className="site-header__nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/campus">Campus Life</NavLink>
        </nav>
      </div>
    </header>
  );
}

Navigation.propTypes = {};

export default Navigation;

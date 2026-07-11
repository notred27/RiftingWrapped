import { Link } from 'react-router-dom';


export default function SiteHeader() {
    return (
        <header className="site-header">
            <span style={{ display: "flex", gap: "5px", width: "max-content" }}>

                <Link className="site-header__title" to="/">
                    <img src='/favicon-32x32.png' alt='rifting wrapped logo' className="site-header__logo" />&nbsp;Rifting Wrapped</Link>

            </span>
            {/* <nav className="site-header__nav">
                <Link to="/">Home</Link>
                <Link to="/faq">FAQ</Link>
            </nav> */}
        </header>);
}
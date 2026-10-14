export const metadata = { title: "Page not found", robots: { index: false } };
export default function NotFound() {
  return (<main className="section" data-brand="corporate"><div className="container" style={{ maxWidth: 640, textAlign: "center", padding: "4rem 1rem" }}>
    <h1>Page not found</h1><p>The page you are looking for does not exist or has moved.</p><p><a className="btn" href="/">Go to the home page</a></p></div></main>);
}

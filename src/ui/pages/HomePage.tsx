export function HomePage() {
  return (
    <main className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand" aria-label="JFinancial">
          <span className="brand__mark" aria-hidden="true">
            J
          </span>
          <span>JFinancial</span>
        </div>

        <p className="eyebrow">Finanças pessoais · local-first</p>
        <h1 id="hero-title">Olá, João.</h1>
        <p className="hero__description">
          A estrutura base está funcionando. Seus dados financeiros serão
          processados e armazenados somente neste dispositivo.
        </p>

        <div className="status" role="status">
          <span className="status__indicator" aria-hidden="true" />
          Aplicação pronta para o primeiro incremento
        </div>
      </section>
    </main>
  );
}

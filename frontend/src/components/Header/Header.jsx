import "./Header.css";

/**
 * Barra superior da área interna.
 *
 * Correção: o componente antes renderizava um <header> sem className e
 * sem importar o CSS — por isso o título aparecia preto, colado no
 * canto da tela, em vez do cabeçalho azul institucional.
 */
function Header() {
    return (
        <header className="header">
            <div className="header-identidade">
                <span className="header-marca">SRE</span>

                <div>
                    <h1>Painel de Atendimentos</h1>

                    <p>Superintendência Regional de Ensino</p>
                </div>
            </div>
        </header>
    );
}

export default Header;

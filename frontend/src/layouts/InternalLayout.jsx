import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

/**
 * Moldura das telas internas: cabeçalho fixo no topo, menu lateral e a
 * área de conteúdo. O espaçamento do conteúdo é definido uma vez só em
 * index.css (.layout > .conteudo) — antes cada página aplicava o seu
 * próprio padding e as telas ficavam desalinhadas entre si.
 */
function InternalLayout({ children }) {
    return (
        <>
            <Header />

            <div className="layout">
                <Sidebar />

                <main className="conteudo">{children}</main>
            </div>
        </>
    );
}

export default InternalLayout;

import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

function InternalLayout({ children }) {
    return (
        <>
            <Header />

            <div className="layout">
                <Sidebar />
                {children}
            </div>
        </>
    );
}

export default InternalLayout;
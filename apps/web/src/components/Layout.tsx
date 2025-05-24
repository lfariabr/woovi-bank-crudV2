import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

type LayoutProps = {
	children?: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-1 py-8 px-4 sm:px-6 md:px-8 w-full max-w-screen-2xl mx-auto">
				{children}
			</main>
			<Footer />
		</div>
	);
};

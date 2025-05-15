import { Container } from '@mui/material';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

type LayoutProps = {
	children?: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<Navbar />
			<Container 
				maxWidth="xl"
				sx={{
					flex: 1,
					py: 4,
					px: { xs: 2, sm: 3, md: 4 },
					width: '100%',
					maxWidth: '100%',
				}}
			>
				{children}
			</Container>
			<Footer />
		</div>
	);
};

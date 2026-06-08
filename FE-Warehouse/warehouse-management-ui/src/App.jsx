import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@core/store';
import { ThemeProvider } from '@core/theme';
import AppRoutes from '@config/routes';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

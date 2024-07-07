import React from 'react';
import './App.css';
import MainPage from './pages/mainPage';

function App() {
  return (
    <div className="App"> {/** The whole page */}

      <div className='Main'> {/** Main part of the page, aka, without headers and footers */}

        <MainPage />
      </div>
      
    </div>
  );
}

export default App;

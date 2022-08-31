import axios from 'axios';
import './App.css';
import RequestPage from './request-page/RequestPage';

function App() {
  axios.defaults.withCredentials = true;
  return (
    <div className="App">
      <RequestPage/>
    </div>
  );
}

export default App;

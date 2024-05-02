import logo from './logo.svg';
import './App.css';
// import ImageInput from './components/Input';
// import ImageCanvas from './components/ImageCanvas';
// import ImageList from './components/ImageList';
import ParentComponent from './components/ParentComponent';



function App() {
  return (
    <div className="App">
       <div className="app-container">
       <ParentComponent></ParentComponent>
      </div>
    </div>
  );
}

export default App;

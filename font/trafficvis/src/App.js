// import './App.css';
import { Routes, Route } from "react-router-dom";
import Test from './components/test/test';
import TestThree from './components/testThree/testThree';
import TestList from './components/testList/testlist';
import MainView  from './components/mainView/mainView';
import Layout from './layout/layout'
import Box from './components/Box/box'
import ChordFlow from './components/chordFlow/chordFlow';
function App() {
  return (
    <div className="App">
     <Routes>
     <Route key="layout" path='/' element={<Layout></Layout>}></Route>
     <Route key="mainView" path="/mainView" element={<MainView></MainView>}></Route>
     </Routes>
    </div>
  );
}

export default App;

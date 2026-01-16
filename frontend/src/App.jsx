
import './style/app.css'
import NavBar from './components/navbar'
import { Routes, Route } from 'react-router-dom'
import AddTask from './components/AddTask'
import List from './components/List'
import UpdateTask from './components/UpdateTask'

import Login from './components/Login'
import Protected from './components/Protected'
import SignUp from './components/SignUp'
function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={<Protected><List /></Protected>} />
        <Route path='/add' element={<Protected><AddTask /></Protected>} />
        <Route path='/update/:id' element={<Protected><UpdateTask /></Protected>} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  )
}

export default App

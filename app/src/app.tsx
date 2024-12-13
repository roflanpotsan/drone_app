import { Route, A, Router } from "@solidjs/router";
import Home from "./pages/home/home";

const App = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="*" component={Home} />
    </Router>
  );
};

export default App;

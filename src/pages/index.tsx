import { Button } from "@/components/components/button";
import Navbar from "@/components/components/navbar/Navbar";
import Container from "@/components/components/global/Container";

function HomePage() {
  return (
    <div>
      <Navbar />
      <Container>
        <h1 className="text-3xl">HomePage</h1>
        <Button variant="outline" size="lg" className="capitalize m-8">
          Click me
        </Button>
      </Container>
    </div>
  );
}
export default HomePage;

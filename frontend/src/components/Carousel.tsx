import Carousel from 'react-bootstrap/Carousel';
import homeAndGardenImg from '../assets/maneatingplant.jpg';
import healthImg from '../assets/minerals2.jpg';
import techImg from '../assets/hal9000.jpg';

function HomepageCarousel() {
  return (
    <div className="mt-6 shadow-lg rounded-xl overflow-hidden">
      <Carousel fade interval={5000} indicators={true}>
        
        {/* Slide 1 */}
        <Carousel.Item className="h-[450px] relative">
          <img
            className="d-block w-full h-full object-cover"
            src={homeAndGardenImg}
            alt="Home and Garden"
          />
          <div className="absolute inset-0 bg-black/40" />
          <Carousel.Caption className="absolute inset-0 flex items-center justify-center text-center">
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl tracking-tight text-white drop-shadow-md">
              Plants for the whole family!
            </h1>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item className="h-[450px] relative">
          <img
            className="d-block w-full h-full object-cover"
            src={healthImg}
            alt="Health Sh!t"
          />
          <div className="absolute inset-0 bg-black/40" />
          <Carousel.Caption className="absolute inset-0 flex items-center justify-center text-center">
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl tracking-tight text-white drop-shadow-md">
              Supplements for the whole family!
            </h1>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Slide 3 */}
        <Carousel.Item className="h-[450px] relative">
          <img
            className="d-block w-full h-full object-cover"
            src={techImg}
            alt="Tech Sh!t"
          />
          <div className="absolute inset-0 bg-black/40" />
          <Carousel.Caption className="absolute inset-0 flex items-center justify-center text-center">
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl tracking-tight text-white drop-shadow-md">
              Gadgets for the whole family!
            </h1>
          </Carousel.Caption>
        </Carousel.Item>

      </Carousel>
    </div>
  );
}

export default HomepageCarousel;
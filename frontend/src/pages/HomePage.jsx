import Category from "../components/Home/Category";
import Featured from "../components/Home/Featured";
import Gallery from "../components/Home/Gallery";
import Hero from "../components/Home/Hero";
import Promotion from "../components/Home/Promotion";
import Steps from "../components/Home/Steps";
import Navbar from "../components/Navbar";


function HomePage(){
    return(
        <>
            <Navbar/>
            <Hero/>
            <Featured/>
            <Category/>
            <Steps/>
            
            <Gallery/>
                        
        </>
    );
}

export default HomePage
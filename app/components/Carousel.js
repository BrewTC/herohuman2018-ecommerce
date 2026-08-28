"use client";

import React from "react";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const slides = [
  {
    src: "/mooncake_6pcs_assorted.png",
    alt: "喜洛六入綜合月餅禮盒",
  },
  {
    src: "/mooncake_3pcs_assorted.png",
    alt: "喜洛三入綜合月餅禮盒",
  },
];

function CarouselArrow({ direction, onClick }) {
  const isNext = direction === "next";

  return (
    <button
      type="button"
      className={`carousel-arrow ${isNext ? "carousel-arrow-next" : "carousel-arrow-prev"}`}
      aria-label={isNext ? "下一張輪播圖" : "上一張輪播圖"}
      onClick={onClick}
    >
      <span aria-hidden="true">{isNext ? "›" : "‹"}</span>
    </button>
  );
}

const Carousel = () => {
  const settings = {
    infinite: true,
    speed: 750,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    prevArrow: <CarouselArrow direction="prev" />,
    nextArrow: <CarouselArrow direction="next" />,
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.src} className="Grid-row">
            <div className="Grid-item">
              <img
                src={slide.src}
                alt={slide.alt}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;

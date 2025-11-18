export const MEDIA = {
  logos: {
    servisca: {
      src: "/images/logo.svg",
      alt: "Servisca",
      width: 137,
      height: 25,
    },
    email: "/images/verify-email.svg",
  },
  icons: {
    userLogin: "/images/login_logo.png",
    userSignup: "/images/sign-up.png",
    location: "/images/location_icon.png",
    clock: "/images/clock.png",
    email: "/images/email_icon.png",
    arrow: "/images/arrow.png",
    submit: "/images/submit_button.png",
    mini_logo: "/images/mini_logo.svg",
    social: {
      google: "",
      facebook: "",
      apple: "",
    },
  },
  badges: {
    googlePlay: "/images/google_play_badge.png",
    appStore: "/images/apple_store_badge.png",
    subscribe: "/images/subscribe_badge.png",
  },
  footer: {
    logo: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/q51M4igVs3/okq5sf41_expires_30_days.png",
  },
  landing: {
section1:{
img1: "/images/talent.svg",
img2: "/images/handyman_services.png",
img3: "/images/makeup_artist.jpg",
img4: "/images/moving.png",
img5: "/images/join_pattern.png",
img6: "/images/tasker_img.png",

},
section2:{
img1: "/images/haircut_man.png",
img2: "/images/haircut.svg",
},
section3:{
  img1: "/images/how_do1.jpg",
  img2: "/images/how_do2.jpg",
  img3: "/images/how_do3.jpg",
  img4: "/images/how_do s2 img1.png",
  img5: "/images/how_do s4 img1.png",
  img6: "/images/how_do s4 img2.png",
  img7: "/images/how_do s4 img3.png",
  img8: "/images/how_do s4 img4.png",
  img9: "/images/vast_range.svg",
  img10: "/images/sec_3.png",
  img11: "/images/how_do overlay_1.svg fill.png",
},
section4:{
img1:"/images/s4 img1.png",
img2:"/images/s4 img2.png",
img3:"/images/s4 img3.png",
img4:"/images/s4 img4.png",
},
section5:{
img1:"/images/s5 star_empty.png",
img2:"/images/s5 star_filled.png",
img3:"/images/pro img1.jpg",
img4:"/images/pro img2.png",
img5:"/images/Verification Icon Container.png",

},
section6:{
  img1: "/images/talent.svg",
  img2: "/images/tasker img1.png",
  img3: "/images/how_do overlay_1.svg fill.png",
},
section7:{
  img1:"/images/superhero img1.jpg",
  img2:"/images/superhero img2.png",
  img3: "/images/customer img1.png",
  img4: "/images/customer img2.png",
  img5: "/images/customer img3.png",
  img6: "/images/right-layer.svg.png",
  icons:{
  img1: "/images/s7 icon1.png",
  img2: "/images/s7 icon2.png",
  img3: "/images/s7 icon3.png",

}

  },
  },
  auth: {
    google: "/images/google.png",
    facebook: "/images/facebook.png",
    apple: "/images/apple.png",
    signup: {
      taskersImage: "/images/talent.svg", // Leave empty as per requirements
      logo: "/images/logo.png",
    },
    login: {
      logo: "/images/logo.png",
    },
  },
} as const;

export type MediaConfig = typeof MEDIA;



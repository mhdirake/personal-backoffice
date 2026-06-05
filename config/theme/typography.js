export const typography = {
  fontFamily: "var(--font-inter, 'Helvetica Neue', Arial, sans-serif)",

  subtitle1: { fontSize: "12px", fontWeight: 400 },
  subtitle2: { fontSize: "10px", fontWeight: 400 },

  h1: {
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: 1.2,
    "@media (max-width: 900px)": { fontSize: "26px" },
    "@media (max-width: 600px)": { fontSize: "22px" },
  },
  h2: {
    fontSize: "26px",
    fontWeight: 600,
    "@media (max-width: 900px)": { fontSize: "22px" },
    "@media (max-width: 600px)": { fontSize: "18px" },
  },
  h3: {
    fontSize: "20px",
    fontWeight: 600,
    "@media (max-width: 900px)": { fontSize: "18px" },
  },
  h4: {
    fontSize: "17px",
    fontWeight: 500,
    "@media (max-width: 768px)": { fontSize: "15px" },
  },
  h5: {
    fontSize: "15px",
    fontWeight: 500,
    "@media (max-width: 600px)": { fontSize: "13px" },
  },
  h6: {
    fontSize: "14px",
    fontWeight: 400,
  },
  body1: { fontSize: "14px", lineHeight: 1.6 },
  body2: { fontSize: "13px", lineHeight: 1.5 },
};

export default typography;

import { Helmet } from "react-helmet-async";

const DefaultMeta = () => {
  return (
    <Helmet defaultTitle="Covalent Community" titleTemplate="%s">
      <meta
        name="description"
        content="Where engineering students connect anonymously and build strong bonds through passion and purpose."
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Covalent" />
      <meta property="og:title" content="Covalent Community" />
      <meta
        property="og:description"
        content="Where engineering students connect anonymously and build strong bonds through passion and purpose."
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Covalent Community" />
      <meta
        name="twitter:description"
        content="Where engineering students connect anonymously and build strong bonds through passion and purpose."
      />
    </Helmet>
  );
};

export default DefaultMeta;

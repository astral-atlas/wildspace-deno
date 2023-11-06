export const style = {
  editorRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  slideContainer: {
    zIndex: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  classicSlideContainer: {
    margin: '24px',
    display: 'flex',
    flexDirection: 'column'
  },
  titleContainer: {
    display: 'flex',

    marginTop: "auto",
    marginBottom: "auto",
    textAlign: 'center',
    width: '100%',
    padding: '32px',
    backgroundColor: `rgba(0, 0, 0, 0.4)`,
    boxShadow: `0 0 8px 0px rgba(0, 0, 0, 0.4)`,
    color: 'white',
    backdropFilter: `blur(2px)`,
  },
  heading: {
    fontSize: '32px',
    marginTop: '20px',
    marginBottom: '20px',
  },
  description: {
    fontSize: '32px',
    marginTop: '20px',
    marginBottom: '20px',
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    zIndex: -1,
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
} as const;

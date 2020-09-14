<template>
  <div class="about-page">
    <h1>About cadence matcher</h1>
    <p>The cadence matcher application tries to find songs matching your search critera using the spotify recommendation api.</p>
    <p>Nothing is stored or tracked about you except your login tokens from spotify and your search filter settings.</p>
    <p>
      The non standard fonts used are
      <b>'PT Sans'</b> and
      <b>'Roboto'</b> and are supplied via
      <a href="https://fonts.google.com/" target="_blank">Google Fonts</a>
    </p>
    <h2>Search</h2>
    <p>The following information should help you making the best matches and hopefully explain what each term means.</p>
    <h3>General</h3>
    <ul>
      <li>
        <b>Minimum values:</b>
        <br />
        <div class="p">
          For each tunable track attribute, a hard floor on the selected track attribute’s value can be provided.
          See tunable track attributes below for the list of available options. For example,
          <pre>min_tempo=140</pre> would
          restrict results to only those tracks with a tempo of greater than 140 beats per minute.
        </div>
      </li>
      <li>
        <b>Maximum values:</b>
        <br />
        <div class="p">
          For each tunable track attribute, a hard ceiling on the selected track attribute’s value can be provided.
          See tunable track attributes below for the list of available options. For example,
          <pre>max_instrumentalness=0.35</pre> would filter out most tracks that are likely to be instrumental.
        </div>
      </li>
      <li>
        <b>Target values:</b>
        <br />
        <div class="p">
          For each of the tunable track attributes (below) a target value may be provided.
          Tracks with the attribute values nearest to the target values will be preferred.
          For example, you might request
          <pre>target_energy=0.6</pre> and
          <pre>target_danceability=0.8</pre>.
          All target values will be weighed equally in ranking results.
        </div>
      </li>
    </ul>
    <h3>Search terms</h3>
    <ul>
      <li>
        <b>Tempo:</b>
        <br />
        <p>
          The overall estimated tempo of a track in beats per minute (BPM).
          In musical terminology, tempo is the speed or pace of a given piece and
          derives directly from the average beat duration.
        </p>
      </li>
      <li>
        <b>Energy:</b>
        <br />
        <p>
          Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity.
          Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy,
          while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute
          include dynamic range, perceived loudness, timbre, onset rate, and general entropy.
        </p>
      </li>
      <li>
        <b>Acousticness:</b>
        <br />
        <p>A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.</p>
      </li>
      <li>
        <b>Danceability:</b>
        <br />
        <p>
          Danceability describes how suitable a track is for dancing based on a combination of musical
          elements including tempo, rhythm stability, beat strength, and overall regularity.
          A value of 0.0 is least danceable and 1.0 is most danceable.
        </p>
      </li>
      <li>
        <b>Instrumentalness:</b>
        <br />
        <p>
          Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context.
          Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0,
          the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent
          instrumental tracks, but confidence is higher as the value approaches 1.0.
        </p>
      </li>
      <li>
        <b>Liveness:</b>
        <br />
        <p>
          Detects the presence of an audience in the recording. Higher liveness values represent an increased
          probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.
        </p>
      </li>
      <li>
        <b>Valence:</b>
        <br />
        <p>
          A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence
          sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).
        </p>
      </li>
    </ul>
  </div>
</template>
<script>
export default {};
</script>

<style lang="scss">
.about-page {
  color: #fff;

  .p {
    margin: 0 0 10px;
  }
  pre {
    display: inline;
    background: #ccc;
    padding: 0 5px;
    font-weight: bold;
  }
}
</style>
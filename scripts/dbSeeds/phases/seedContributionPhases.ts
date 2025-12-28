import { populatePhaseWithContent } from "../seedPhases";
import { createPhase } from "./createPhase";

const contributionPhase = {
  id: "contribution-projects",
  slug: "contribution-projects",
  title: "Project Contributions",
  description: "Start building projects on Github",
  color: "from-blue-400 to-blue-600",
  icon: "Project",
  order: 11,
  estimatedWeeks: 6,
  prerequisites: ["Terminal usage", "Github", "Javascript", "CSS", "HTML"],
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const seedContributionPhases = async () => {
    createPhase(contributionPhase)

  await populatePhaseWithContent(
    "contribution-projects",
    "contribution-projects",
    "Project Contributions"
  );
};

seedContributionPhases()
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

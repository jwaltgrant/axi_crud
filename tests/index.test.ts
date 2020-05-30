import axios from "axios";
import { mocked } from "ts-jest/utils";
import AxiCrud from "../src/index";

jest.mock("axios");
const mockedAxios = mocked(axios, true);

const SchoolAPI = mockedAxios.create({
  baseURL: "http://school.app",
});

interface IClass {
  teacher: string;
  title: string;
  students: number[];
}

interface IStudent {
  name: string;
  grade: string;
}

const ClassAPI = new AxiCrud<IClass>(SchoolAPI, "classes");

test("should get classes", () => {
  const classes: IClass[] = [
    {
      teacher: "Mr. T",
      title: "Econ",
      students: [1, 3, 5, 7],
    },
    {
      teacher: "Mrs. M",
      title: "Calculus",
      students: [2, 4, 6, 8],
    },
  ];
  const resp = { data: classes };
  mockedAxios.get.mockResolvedValue(resp);
  return ClassAPI.withList((data) => {
    expect(data).toEqual(classes);
  });
});

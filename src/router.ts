import express from "express";
import { algorithmFunc } from "./algorithm";
import bodyParser from "body-parser";
import { config } from "./config";
import { PersonModel } from "./person/person.model";
import { IPersonResult } from "./person/person.interface";

export class Server {
  app: express.Application;
  port: number;
  router: express.Router;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.router = express.Router();
  }

  public config(): void {
    this.app.set("port", this.port);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // Add headers before the routes are defined
    this.app.use(function (req, res, next) {
      // Website you wish to allow to connect
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Request methods you wish to allow
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );

      // Request headers you wish to allow
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
      );

      // Pass to next layer of middleware
      next();
    });

    this.initRoutes();
    this.app.use(this.router);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public initRoutes() {
    this.router.get(
      "/api/calculator/",
      async (req: express.Request, res: express.Response) => {
        const origin = req.query.origin as string;
        const destination = req.query.destination as string;
        const arrival_time = +(req.query.arrival_time as string);
        const departure_time = +(req.query.departure_time as string);

        const routes = await algorithmFunc(
          origin,
          destination,
          arrival_time,
          departure_time
        );
        res.send(routes);
      }
    );

    this.router.get(
      "/api/person/",
      async (req: express.Request, res: express.Response) => {
        const people = await PersonModel.find({});
        res.send(people);
      }
    );

    // Delete person by id
    this.router.delete(
      "/api/person/:id/",
      async (req: express.Request, res: express.Response) => {
        const person = await PersonModel.findById(req.params.id);
        console.log(`id: ${req.params.id} person to delete`, person);
        if (person) {
          person.remove();
          res.sendStatus(204);
        } else {
          res.sendStatus(404);
        }
      }
    );

    this.router.post(
      "/api/person",
      async (req: express.Request, res: express.Response) => {
        const sex = (req.body.sex as string) || "MALE";
        const address = req.body.address as string;
        const fullName = req.body.fullName as string;
        const serviceType = req.body.serviceType as string;
        const statusExpiration = req.body.statusExpiration as string;

        let newPerson: IPersonResult;
        try {
          const calculation = {
            calculation: await algorithmFunc(
              address,
              config.baseAddress,
              1667372400
            ),
          };

          const person: IPersonResult = {
            sex,
            address,
            fullName,
            serviceType,
            statusExpiration,

            // turn calculation into string
            routeCalculations: JSON.stringify(calculation),
          };
          // Save person to mongoDB

          newPerson = await PersonModel.create(person);
          res.send({ newPerson, success: true, error: null });
        } catch (err) {
          console.log(err);
          res.send({ newPerson: null, success: false, error: err });
        }
      }
    );

    this.router.get("/", function (req: any, res: any, next: any) {
      console.log("Router Working");
      res.end();
    });
  }
}

export class Router {
  private app: express.Application;

  constructor(app: express.Application) {
    this.app = app;
  }
}

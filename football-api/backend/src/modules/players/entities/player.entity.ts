import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity({name: 'players'})
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  club: string;

  @Column()
  position: string;

  @Column()
  nationality: string;

  @Column()
  rating: number;

  @Column()
  speed: number;

  @Column()
  shooting: number;

  @Column()
  dribbling: number;

  @Column()
  passing: number;

  @Column({ name: 'player_face_url', type: 'varchar', length: 512, nullable: true })
  playerFaceUrl: string | null;
}